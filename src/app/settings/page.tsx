"use client"
import React, { useRef, useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useSession } from "next-auth/react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';  
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Loader from "@/components/common/Loader";

const Settings = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  const [file, setFile] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    if (session) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        username: session.user.username || "",
        password: "",
      });
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/settings?userId=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user information");
      }

      const result = await response.json();
      console.log("User updated successfully:", result);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Settings updated successfully', life: 3000 });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to update settings', life: 3000 });
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No file selected', life: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/uploadpic?userId=${userId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      console.log("Image uploaded successfully:", result);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Profile picture updated successfully', life: 3000 });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to upload image', life: 3000 });
    }
  };

  if (status === "loading") {
    return <Loader/>; // You can replace this with a spinner or other loading indicator
  }

  return (
    <DefaultLayout>
      <Toast ref={toast} />
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Informations Personnelles
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmit}>
                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="name"
                      >
                        Nom Complet
                      </label>
                      
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-4.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      
                    </div>

                  
                  

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <Button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() =>
                        setFormData({
                          name: session?.user?.name || "",
                          email: session?.user?.email || "",
                          username: session?.user?.username || "",
                          password: "",
                        })
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Photo de Profil
                </h3>
              </div>
              <div className="p-7">
              <div className="mb-4 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full">
                      <Image
                        src={"/images/user/user-03.png"}
                        width={55}
                        height={55}
                        alt="User"
                      />
                    </div>
                    <div>
                      <span className="mb-1.5 text-black dark:text-white">
                        Modifier votre photo
                      </span>
                      <span className="flex gap-2.5">
                        <button className="text-sm hover:text-primary">
                          Supprimer
                        </button>
                        <button className="text-sm hover:text-primary">
                          Mettre a jour
                        </button>
                      </span>
                    </div>
                  </div>
                <div className="flex items-center gap-4">
                  
                  
                    <div className="h-24 w-24 rounded-full bg-gray-200"></div>
                 

                  <form onSubmit={handleImageUpload} className="w-full">
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full"
                      />
                    </div>

                    <div className="flex mr-25">
                      <Button
                        className="flex justify-center mr-2.5 rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                        type="button"
                        onClick={() => setFile(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                        type="submit"
                      >
                        Upload
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Settings;
