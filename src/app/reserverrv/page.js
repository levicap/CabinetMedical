import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { DefaultDeserializer } from "v8";
import Rv from "@/components/reservation/rv";

function Reserver() {
  return (
    <DefaultLayout>
        <div>
      <h1 className="mb-2.5 ml-2.5 font-medium text-2xl text-black">Reserver Rendez-vous</h1>
      
      <Rv/>

    </div>
    </DefaultLayout>
    
  );
}
export default Reserver;