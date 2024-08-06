import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UsersDemo from "@/components/crudtable/table7";

function User() {
    return (
        <DefaultLayout>
            <div>
                <h1 className="mb-2.5 ml-2.5  font-medium text-2xl text-black">Gestion Utilisateurs</h1>
                <UsersDemo />
                
                </div>
        </DefaultLayout>)
    
}
export default User;