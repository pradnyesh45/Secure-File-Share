import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { fileApi } from "../../services/fileApi";
import { ClipboardDocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ShareModal = ({ isOpen, onClose, file }) => {
  const [shareType, setShareType] = useState("link"); // 'link' or 'user'
  const [email, setEmail] = useState("");
  const [expiration, setExpiration] = useState("24"); // hours
  const [shareLink, setShareLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateLink = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fileApi.shareFile(file.id, {
        type: "link",
        expiration_hours: parseInt(expiration),
      });
      setShareLink(response.data.share_link);
    } catch (err) {
      setError("Failed to generate sharing link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWithUser = async () => {
    setIsLoading(true);
    setError("");
    try {
      await fileApi.shareFile(file.id, {
        type: "user",
        email: email,
      });
      onClose();
    } catch (err) {
      setError("Failed to share with user");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // You could add a toast notification here
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  Share "{file?.name}"
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {error && (
                  <div className="mt-2 text-sm text-red-600">{error}</div>
                )}

                <div className="mt-4">
                  <div className="flex space-x-4 mb-4">
                    <button
                      className={`px-4 py-2 rounded-md ${
                        shareType === "link"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setShareType("link")}
                    >
                      Share Link
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md ${
                        shareType === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setShareType("user")}
                    >
                      Share with User
                    </button>
                  </div>

                  {shareType === "link" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Link Expiration
                        </label>
                        <select
                          value={expiration}
                          onChange={(e) => setExpiration(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="24">24 hours</option>
                          <option value="48">48 hours</option>
                          <option value="168">7 days</option>
                          <option value="720">30 days</option>
                        </select>
                      </div>

                      {!shareLink ? (
                        <button
                          onClick={handleGenerateLink}
                          disabled={isLoading}
                          className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                          {isLoading ? "Generating..." : "Generate Share Link"}
                        </button>
                      ) : (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              readOnly
                              value={shareLink}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <button
                              onClick={copyToClipboard}
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <ClipboardDocumentIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          User Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Enter user email"
                        />
                      </div>

                      <button
                        onClick={handleShareWithUser}
                        disabled={isLoading || !email}
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      >
                        {isLoading ? "Sharing..." : "Share"}
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShareModal;
