"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  hydrateRecorderSessionFromSearchParams,
  RECORDER_SESSION_MODE,
} from "~/lib/buzz/session";
import AuthSessionSetup from "~/components/auth/auth-session-setup";
import {
  handleSessionExpired,
  isUnauthorizedResponse,
} from "~/utils/auth-session";
import { isReservedPathSegment } from "~/lib/reserved-paths";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, dispatch } = useContext(DataContext);
  const fetchedSessionRef = useRef<{
    token: string | null;
    orgId: string | null;
    profileCallback: boolean;
  } | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
      if (isReservedPathSegment(firstSegment)) {
        setLoading(false);
        return;
      }

      const isRecorderRoute = pathname.includes("/buzz-record/");
      let orgId = localStorage.getItem("orgId");
      let token = localStorage.getItem("token");

      if (isRecorderRoute) {
        const session = hydrateRecorderSessionFromSearchParams(searchParams);
        if (session.token) {
          token = session.token;
        }
        if (session.orgId) {
          orgId = session.orgId;
        }
        if (session.isRecorder) {
          dispatch({
            type: ACTIONS.BUZZ_SESSION_MODE,
            payload: RECORDER_SESSION_MODE,
          });
        }
      }

      dispatch({ type: ACTIONS.TOKEN, payload: token });
      dispatch({ type: ACTIONS.ORG_ID, payload: orgId });

      // Construct redirect URL once
      const currentFullUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentFullUrl)}`;

      // 1. Immediate local check
      if (!orgId || !token) {
        fetchedSessionRef.current = null;
        // Only redirect if we aren't already on an auth page
        if (!pathname.startsWith("/auth")) {
          router.push(loginUrl);
        }
        setLoading(false);
        return;
      }

      const profileCallback = state?.profileCallback ?? false;
      const shouldRefetchProfile =
        !fetchedSessionRef.current ||
        fetchedSessionRef.current.token !== token ||
        fetchedSessionRef.current.orgId !== orgId ||
        fetchedSessionRef.current.profileCallback !== profileCallback;

      if (!shouldRefetchProfile) {
        setLoading(false);
        return;
      }

      try {
        // 2. Parallel API calls for performance
        const [profileRes, orgRes] = await Promise.all([
          GetRequest(`/profile`),
          GetRequest(`/organisations/${orgId}`),
        ]);

        if (
          isUnauthorizedResponse(profileRes) ||
          isUnauthorizedResponse(orgRes)
        ) {
          fetchedSessionRef.current = null;
          handleSessionExpired();
          return;
        }

        // Handle Profile Response
        if (profileRes?.status === 200 || profileRes?.status === 201) {
          dispatch({ type: ACTIONS.USER, payload: profileRes?.data?.data });
        }

        // Handle Org Response
        if (orgRes?.status === 200 || orgRes?.status === 201) {
          const organisationSlug =
            orgRes.data.data.organisation_slug ||
            orgRes.data.data.current_organisation_slug ||
            pathname.split("/")[1];

          if (organisationSlug && organisationSlug !== "undefined") {
            localStorage.setItem("orgSlug", organisationSlug);
            dispatch({
              type: ACTIONS.ORG_SLUG,
              payload: organisationSlug,
            });
          }
          dispatch({
            type: ACTIONS.ORG_DATA,
            payload: orgRes.data.data,
          });
        } else {
          // Org fetch failed — still seed slug from the URL so ClientLayout
          // does not treat a missing slug as an org switch and flash /404.
          const urlSlug = pathname.split("/")[1];
          if (urlSlug && urlSlug !== "undefined" && urlSlug !== "client") {
            localStorage.setItem("orgSlug", urlSlug);
            dispatch({
              type: ACTIONS.ORG_SLUG,
              payload: urlSlug,
            });
          }
        }

        fetchedSessionRef.current = { token, orgId, profileCallback };
      } catch (error) {
        console.error("AuthGuard Initialization Error:", error);
        fetchedSessionRef.current = null;
        if (!pathname.startsWith("/auth")) {
          router.push(loginUrl);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [dispatch, pathname, searchParams, router, state?.profileCallback]);

  if (loading) return null;

  return (
    <>
      <AuthSessionSetup />
      {children}
    </>
  );
};

export default AuthGuard;
