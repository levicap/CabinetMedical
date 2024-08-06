import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DiagnosisTable from "@/components/crudtable/table6";
function Details(){
    return (
        <DefaultLayout>
        <div>
            <h1 className="mb-2.5 ml-2.5 font-medium text-2xl text-black">Enregistrer Details Consultation </h1>
           <DiagnosisTable/> 
            

              

        </div>
        </DefaultLayout>
    )
}
export default Details;