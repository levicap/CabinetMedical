import { Googlesingin } from "@/actions/actions"
 
export default function Google() {
  return (
    <form
      action={Googlesingin}
      className="sign-in-form"
    >
      <button type="submit"                       className="flex mt-2.5 justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
      >Signin with Google</button>
    </form>
  )
} 