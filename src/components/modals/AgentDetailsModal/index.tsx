"use client";
import React from "react";

interface ComponentProps {
  closeModal: () => void;
  agent: any;
}

export const AgentDetailsModal = (props: ComponentProps) => {
  return (
    <div className="w-screen h-screen fixed top-0 right-0 flex items-center justify-center">
      <div
        onClick={() => props.closeModal()}
        className="w-full h-full absolute bg-black opacity-20"
      ></div>
      <div className="bg-white w-[400px] lg:w-[600px] flex flex-col rounded-xl  z-10 gap-8">
        <div className="border-b border-gray-200 p-6 pb-4">
          <h1 className="text-[#1D2939] border-b border-gray-200 lg:text-xl text-lg pb-5 mb-3 font-semibold leading-normal">
            Agent Details
          </h1>

          <div className="w-full agent_container max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="border-b border-gray-200 pb-5">
              <div className="space-y-4">
                <h1 className="text-base">
                  <strong>Name</strong>: {props.agent.app_name}
                </h1>
                <h1 className="text-base">
                  <strong>Organisation</strong>:{" "}
                  {props.agent?.provider?.organization}
                </h1>
                <p className="text-base">
                  <strong>Agent Key</strong>:{" "}
                  {props.agent?.preshared_key
                    ? props.agent.preshared_key
                    : "Not Available"}
                </p>
                <p className="text-base">
                  <strong>Status</strong>:{" "}
                  {props.agent?.is_active ? "Active" : "Inactive"}
                </p>
                <p className="text-base">
                  <strong>URL</strong>: {props.agent.json_url}
                </p>

                <p className="text-base">
                  <strong>Paid</strong>: {props.agent.is_paid ? "Paid" : "Free"}
                </p>
                <p className="text-base">
                  <strong>Approved</strong>:{" "}
                  {props.agent?.is_approved ? "Approved" : "Not Approved"}
                </p>
                <p className="text-base">
                  <strong>Version</strong>:{" "}
                  {props.agent?.version ? props.agent?.version : "1.0.0"}
                </p>
              </div>
            </div>

            <div className="border-b border-gray-200 mt-5">
              <strong className="mt-3">Description</strong>
              <p className="text-[rgba(110,110,111,1)] mb-3">
                {props.agent?.app_description}
              </p>
            </div>

            <div className="border-b border-gray-200 mt-5 pb-5">
              <strong className="lg:text-xl text-lg">Agent Prices</strong>
              {props.agent?.prices?.map((price: any, index: number) => {
                return (
                  <div key={index} className="space-y-4">
                    <p className="text-base mt-5">
                      <strong>Amount</strong>: {price.amount}
                    </p>
                    <p className="text-base">
                      <strong>Currency Code</strong>: {price.currency}
                    </p>
                    <p className="text-base">
                      <strong>Operation Type</strong>: {price.operation_type}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-b border-gray-200 mt-5 pb-5 mb-5">
              <strong className="lg:text-xl text-lg">Agent Skills</strong>
              {props.agent?.skills?.map((skill: any, index: number) => {
                return (
                  <div key={index} className="space-y-4">
                    <p className="text-base mt-5">
                      <strong>Name</strong>: {skill.name}
                    </p>
                    <p className="text-base">
                      <strong>Tags</strong>: {skill.tags?.join(", ")}
                    </p>
                    <p className="text-base">
                      <strong>Description</strong>: {skill.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
