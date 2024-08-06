import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DossierMedicalManagement from "@/components/crudtable/table5";

function Dossier() {
  return (
    <DefaultLayout> 

    <div>
      <h1 className="mb-2.5 ml-2.5 font-medium text-2xl text-black">Gestion Dossier Medical</h1>
      <DossierMedicalManagement/>
      
    </div>
  </DefaultLayout>  
  );
}
export default Dossier;