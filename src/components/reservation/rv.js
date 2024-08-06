import Image from 'next/image'
function Rv() {
  return (
    <div className='flex flex-row bg-white h-300'>
      
      <form>
      <div className="mt-4.5 ml-6.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">Date Rendez-vous </label>
            <input className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"type="text" name="name" />
        </div>
        <div className="mt-4.5 ml-6.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">Heure Rendez-vous </label>
            <input className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"type="text" name="name" />
        </div>
        <div className="mt-4.5 ml-6.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">Raison Rendez-vous </label>
            <input placeholder="ex-checkup annuel ou du mois"className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"type="text" name="name" />
        </div>
        <div className="w-80 h-24 mt-4.5 ml-6.5">
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Informations Additionel
                  </label>
                  <textarea
                    rows={6}
                    placeholder="ex-je prefere les rendez vous le matin"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent h-16 px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
        </div>
        <div className="mt-4.5 ml-6.5">
           <label className="mb-3 block text-sm font-medium text-black dark:text-white">Choisir Docteur </label>

           <select
              name="#"
              id="#"
              className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            >
              <option value="" className="">
              DR.Mohamed Karay
              </option>
              <option value="" className="dark:bg-boxdark">
              <img src="/doc.jpg" alt="Document Image" />

              DR.Monji Karay
              </option>
              <option value="" className="dark:bg-boxdark">
              <img src="/doc.jpg" alt="Document Image" />

              DR.Ali Karay
              </option>
             
            </select>
            

           </div>
           <button className="flex mt-5 ml-60 mb-2.5 justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90">Enrigistrer</button>
      </form>
      <img className='w-111 h-96 mt-20 ml-10' src="/rv.png" alt="Document Image" />
    </div>
  );
}
export default Rv;