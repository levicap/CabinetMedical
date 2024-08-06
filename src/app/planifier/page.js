import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DoctorScheduler from "@/components/schedule/schedule";
function Planifier(){
    return (
        <DefaultLayout>
        <div>
            <h1 className="mb-2.5 ml-2.5 font-medium text-2xl text-black">Planifier Horaire Medecin</h1>
            <DoctorScheduler/>
            

              

        </div>
        </DefaultLayout>
    )
}
export default Planifier;