"use client";
import React, { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { PostRequest, PutRequest } from "~/utils/request";
import { Country } from "country-state-city";
import CustomSelect from "~/components/ui/custom-select";
import useFirstChannel from "../../home/channels/hooks/first-channel";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { showError, showSuccess } from "~/components/toast/sonner";
import {
  redirectAfterOrgSwitch,
  resolveChannelIdForOrgSwitch,
} from "~/utils/org-switch";

// initial states
const initialState = {
  organisationName: "",
  organisationEmail: "",
  organisationType: "",
};

const CreateOrganization: React.FC = () => {
  const [buttonloading, setButtonloding] = useState(false);
  const [values, setValues] = useState(initialState);
  const [country, setCountry] = useState<any>(null);
  const [countries, setCountries] = useState<any>([]);
  const { firstChannel } = useFirstChannel();

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  useEffect(() => {
    const allcountries = Country.getAllCountries();
    const response = allcountries?.map((item) => ({
      label: item.name,
      value: item.name,
    }));

    setCountries(response);
  }, []);

  const validateForm = () => {
    const { organisationName, organisationType } = values;
    if (!organisationName || !organisationType) {
      showError("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token") || "";

    setButtonloding(true);

    const payload = {
      name: values.organisationName,
      type: values.organisationType,
      email: "email@email.com",
      country: country?.value,
    };

    const res = await PostRequest(`/organisations`, payload, token);

    if (res?.status === 200 || res?.status === 201) {
      showSuccess(res?.data.message);
      const switchpayload = {
        current_org: res?.data?.data?.id,
      };

      const result = await PutRequest(
        "/users/switch-org",
        switchpayload,
        token
      );

      if (result?.status === 200 || result?.status === 201) {
        localStorage.setItem("token", result?.data?.data?.access_token);
        localStorage.setItem("orgId", result?.data?.data?.organisation?.id);
      }

      const orgSlug = result.data.data.current_organisation_slug;

      const channelId = await resolveChannelIdForOrgSwitch(
        firstChannel,
        result?.data?.data?.organisation?.id
      );

      redirectAfterOrgSwitch(orgSlug, channelId);
    } else {
      setButtonloding(false);
    }
  };

  return (
    <div className="w-full h-screen md:h-[80vh]">
      <div className="w-full max-w-2xl mx-auto my-10 ">
        <h2 className="font-semibold sm:text-3xl text-2xl text-center">
          Create Your Organisation
        </h2>
        <p className=" text-[#6E6E6F] text-md mt-4 mb-6 text-center">
          Input the details of your organisation below
        </p>

        <div className="mx-5 mt-5 md:mx-10">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="form-box mb-3">
                <label className="mb-2 block text-sm font-semibold">
                  Organisation Name
                </label>
                <Input
                  placeholder="Enter your organisation Name"
                  className="focus:border-blue-500 py-6"
                  type="text"
                  value={values.organisationName}
                  onChange={handleChange}
                  name="organisationName"
                  required
                />
              </div>
              <div className="form-box mb-3">
                <label className="mb-2 block text-sm font-semibold">
                  Organisation Type
                </label>
                <Input
                  placeholder="What does your organisation do"
                  className="focus:border-blue-500 py-6"
                  type="text"
                  value={values.organisationType}
                  onChange={handleChange}
                  name="organisationType"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row align-center justify-between gap-6">
                <div className="form-box sm:mb-3 w-full relative z-10">
                  <label className="mb-2 block text-sm font-semibold">
                    Country
                  </label>

                  <CustomSelect
                    options={countries}
                    placeholder="Select an option..."
                    onChange={setCountry}
                    defaultValue={country}
                    isDisabled={false}
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button
                  type="submit"
                  className={`w-full bg-blue-400 font-semibold my-3 py-6 px-10 text-white ${buttonloading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"}`}
                  disabled={buttonloading}
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
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;
