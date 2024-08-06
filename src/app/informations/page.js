import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PrescriptionsDemo from "@/components/tableso/table3";
import DiagnosticsDemo from "@/components/tableso/table4";

function Info() {
  return (
    <DefaultLayout>
        <div>
            <h1 className="mb-2.5 ml-2.5  font-medium text-2xl text-black">Votre Informations Medical</h1>
            <h3 className="mt-10 ml-4 mb-5 text-2xl text-black">Votre Prescriptions</h3>
            <PrescriptionsDemo />
            <h3 className="mt-10 ml-4 mb-5 text-2xl text-black">Votre Diagnostic</h3>

            <DiagnosticsDemo />
            
        </div>
    </DefaultLayout>


    
  );
}
export default Info;