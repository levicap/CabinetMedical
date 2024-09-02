import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PersonelDemo from "@/components/crudtable/table9";

function Gestion() {
  return (
    <DefaultLayout>
         <div>
      <h1 className="mb-2.5 ml-2.5 font-medium text-2xl text-black">Gestion des Personels</h1>
      <PersonelDemo/>
    </div>
    </DefaultLayout>
   
  );
}
export default Gestion;