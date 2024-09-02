import Header from "@/components/Header";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProductsDemo from "@/components/crudtable/table1";

function Gestion() {
  return (
    <DefaultLayout>
         <div >
      <h1 className="mb-2.5 ml-2.5 font-medium text-2xl text-black">Gestion des patients</h1>
      <ProductsDemo/>
    </div>
    </DefaultLayout>
   
  );
}
export default Gestion;