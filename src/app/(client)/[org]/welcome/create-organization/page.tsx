"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Loading from "~/components/ui/loading";
import { GetRequest, PostRequest, PutRequest } from "~/utils/request";
import { Country } from "country-state-city";
import CustomSelect from "~/components/ui/custom-select";
import useFirstChannel from "../../home/channels/hooks/first-channel";
import StepIndicator from "~/components/ui/step-indicator";
import { RegisterWebhookRequest } from "~/utils/webhook-request";
import { DataContext } from "~/store/GlobalState";
import { showError } from "~/components/toast/sonner";
import {
  redirectAfterOrgSwitch,
  resolveChannelIdForOrgSwitch,
} from "~/utils/org-switch";

// The backend auto-creates a workspace at signup, so onboard-status can be
// true before the user has chosen one. A missing type is never default.
const isAutoCreatedOrg = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const type = user?.organisation?.type ?? "";
    return type.trim().toLowerCase() === "user default org";
  } catch {
    return false;
  }
};

// initial states
const initialState = {
  organisationName: "",
  organisationType: "",
};

const CreateOrganization: React.FC = () => {
  const router = useRouter();
  const [buttonloading, setButtonloding] = useState(false);
  const createdOrgIdRef = useRef<string | null>(null);
  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<any>([]);
  const [country, setCountry] = useState<any>(null);
  const { firstChannel } = useFirstChannel();
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  // check if a user is onboarded
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token") || "";

      const userstatus = await GetRequest("/auth/onboard-status", token);

      if (userstatus?.data?.data?.status && !isAutoCreatedOrg()) {
        router.push(`/${orgSlug}`);
      } else {
        setLoading(false);
      }

      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    const allcountries = Country.getAllCountries();
    const response = allcountries?.map((item) => ({
      label: item.name,
      value: item.name,
    }));

    setCountries(response);
  }, []);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  //
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = localStorage.getItem("token") || "";

    setButtonloding(true);

    const payload = {
      name: values.organisationName,
      type: values.organisationType,
      country: country?.value,
    };

    const res = createdOrgIdRef.current
      ? {
          status: 200,
          data: {
            data: { id: createdOrgIdRef.current },
            message: "Organisation created",
          },
        }
      : await PostRequest("/organisations", payload, token);

    if (res?.status === 200 || res?.status === 201) {
      createdOrgIdRef.current = res?.data?.data?.id ?? null;

      // onboard the user
      await PutRequest("/auth/onboard-status", {}, token);

      // Switch into the new organisation so the user lands there.
      const switchResult = await PutRequest(
        "/users/switch-org",
        { current_org: res?.data?.data?.id },
        token
      );

      const switched = switchResult?.data?.data;
      const newSlug = switched?.current_organisation_slug;
      const switchWorked =
        (switchResult?.status === 200 || switchResult?.status === 201) &&
        Boolean(newSlug);

      if (!switchWorked) {
        // Stay here so the user can retry. Never redirect into the old workspace.
        showError(
          "We could not switch to your new workspace. Please try again."
        );
        setButtonloding(false);
        return;
      }

      if (switched?.access_token) {
        localStorage.setItem("token", switched.access_token);
      }

      const switchedOrgId = switched?.organisation?.id ?? res?.data?.data?.id;

      if (switchedOrgId) {
        localStorage.setItem("orgId", String(switchedOrgId));
      }

      const channelId = await resolveChannelIdForOrgSwitch(
        firstChannel,
        switchedOrgId
      );

      redirectAfterOrgSwitch(newSlug, channelId);

      // send webhook
      const webhookData = `
      Organisation Name: ${values.organisationName} \n
      Organisation Type: ${values.organisationType} \n
      Country: ${country.value}
      `;
      RegisterWebhookRequest(
        webhookData,
        "User Completed Onboarding",
        res?.data?.message,
        "success"
      );
    } else {
      setButtonloding(false);
    }
  };

  //

  return (
    <div className="w-full h-[90dvh] mt-0">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mt-10 mb-10 mx-auto">
          <div className="flex gap-2 justify-center md:hidden mb-20">
            <Image src="/TelexIcon.svg" alt="Icon" width={40} height={40} />
            <h1 className="font-semibold text-2xl text-center flex justify-center items-center">
              Zedu
            </h1>
          </div>
        </div>

        <div className="mx-3 md:mx-10">
          {loading ? (
            <div className="w-full flex justify-center mt-20">
              <Loading width="40" height="40" color="blue" />
            </div>
          ) : (
            <div>
              <div className="my-3">
                <StepIndicator currentStep={2} totalSteps={2} />
              </div>
              <h2 className="font-semibold sm:text-3xl text-2xl text-center">
                Create Your Organisation
              </h2>
              <p className=" text-[#6E6E6F] text-md mt-4 mb-6 text-center">
                Input the details of your organisation below
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-box mb-3">
                  <label className="mb-2 block text-sm">
                    Organisation Name
                  </label>
                  <Input
                    placeholder="Enter your organisation Name"
                    className="focus:border-blue-500 py-6"
                    type="text"
                    value={values.organisationName}
                    onChange={handleChange}
                    name="organisationName"
                  />
                </div>

                <div className="form-box mb-3">
                  <label className="mb-2 block text-sm">
                    Organisation Type
                  </label>
                  <Input
                    placeholder="What does your organisation do"
                    className="focus:border-blue-500 py-6"
                    type="text"
                    value={values.organisationType}
                    onChange={handleChange}
                    name="organisationType"
                  />
                </div>

                <div className="flex flex-col sm:flex-row align-center justify-between gap-6">
                  <div className="form-box sm:mb-3 w-full">
                    <label className="mb-2 block text-sm">Country</label>

                    <CustomSelect
                      options={countries}
                      placeholder="Select an option..."
                      onChange={setCountry}
                      defaultValue={country}
                      isDisabled={false}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-400 font-semibold my-3 py-6 px-10 text-white"
                >
                  {buttonloading ? (
                    <span className="flex items-center gap-x-2">
                      <span className="animate-pulse">Loading...</span>{" "}
                      <Loading width="20" height="40" />
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;
