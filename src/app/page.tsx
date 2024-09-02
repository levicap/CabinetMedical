import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";



export default async function Home() {
  const session=await auth()
  if (!session) {
    redirect('/auth')
  }
  return (
    <>
      <DefaultLayout>
        <ECommerce />
      </DefaultLayout>
    </>
  );
}
