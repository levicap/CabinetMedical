import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RendezvousDemo from "@/components/crudtable/table2";
import { auth } from "@/auth";
import { redirect } from "next/navigation";


export default async function  RendezvcousPage() {
 
   return (

    <DefaultLayout><div>
    <h1 className="mb-2.5 ml-2.5 font-medium text-2xl text-black">Gestion Rendez-vous</h1>
    <RendezvousDemo/>   
   
  </div></DefaultLayout>
  );
}   
