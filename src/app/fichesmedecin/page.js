import DefaultLayout from "@/components/Layouts/DefaultLayout";
import MedecinDemo from "@/components/crudtable/table8";

function Gestion() {
  return (
    <DefaultLayout>
         <div>
            <h1 className="mb-2.5 ml-2.5 font-medium text-2xl text-black">Gestion des Medecins</h1>
            <MedecinDemo/>
        </div>
    </DefaultLayout>
   
  );
}
export default Gestion;