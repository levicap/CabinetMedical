function Generate() {
  return (
    <div className="bg-white w-125   ">
      <h1 className="mt-5 ml-5 font-medium text-2xl text-black">Generation Rapport</h1>
      <div>
        <form>
            <div className="mt-4.5 ml-6.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">Date debut </label>
            <input className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"type="text" name="name" />
            </div>
            <div className="mt-4.5 ml-6.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">Date Fin </label>
            <input className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"type="text" name="name" />
            </div>
            <div>

           <div className="mt-4.5 ml-6.5">
           <label className="mb-3 block text-sm font-medium text-black dark:text-white">Choisir critère </label>

           <select
              name="#"
              id="#"
              className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            >
              <option value="" className="dark:bg-boxdark">
                Dossier medical
              </option>
              <option value="" className="dark:bg-boxdark">
                Patients
              </option>
              <option value="" className="dark:bg-boxdark">
                Rendez vous
              </option>
              <option value="" className="dark:bg-boxdark">
                Consultation
              </option>
              <option value="" className="dark:bg-boxdark">
                Dossier medical
              </option>
            </select>

           </div>
           <div className="mt-4.5 ml-6.5">
           <label className="mb-3 block text-sm font-medium text-black dark:text-white">Choisir Format </label>

           <select
              name="#"
              id="#"
              className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            >
              <option value="" className="dark:bg-boxdark">
                Pdf
              </option>
              <option value="" className="dark:bg-boxdark">
                csv
              </option>
              <option value="" className="dark:bg-boxdark">
                excel
              </option>
             
            </select>

           </div>
            </div>
            <button className="bg-primary w-24 h-10 text-white rounded-lg ml-96 mb-2.5">Downold</button>
        </form>
        </div>
    </div>
  );
}
export default Generate;