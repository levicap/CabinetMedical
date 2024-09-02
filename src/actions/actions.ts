"use server"
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/db"



import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";


export const logout = async () => {
  await signOut({ redirectTo: "/auth" });
  revalidatePath("/auth");
};
export async function getUserFromDb(email: string) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}
export const handleform = async (formdata) => {
  await signIn("credentials",formdata);
}
export const Googlesingin = async () => {
  await signIn("google",{redirectTo:"/informations"});
}
export const createuser = async (formdata) => {
  // Step 1: Hash the password
  const hashedPassword = await bcrypt.hash(formdata.password, 10);
  
  // Step 2: Create a new user with the provided email, password, and role
  const newUser = await db.user.create({
    data: {
      email: formdata.email,
      password: hashedPassword,
      role: "patient"
    },
  });

  const { nom, prenom, telephone } = formdata;
  const fullName = `${nom} ${prenom}`;

  // Step 3: Search for an existing patient by phone number, email, or name
  const existingPatient = await db.patient.findFirst({
    where: {
      OR: [
        { telephone: telephone },
        { email: formdata.email },
        { nom: nom, prenom: prenom }
      ]
    }
  });

  if (existingPatient) {
    // Step 4: If a patient is found, update their userId with the newUser's id
    await db.patient.update({
      where: { id: existingPatient.id },
      data: { userId: newUser.id }
    });
  } else {
    // Step 5: If no patient is found, create a new patient linked to the user
    await db.patient.create({
      data: {
        nom,
        prenom,
        adresse: formdata.adresse, // Assuming adresse is part of formdata
        email: formdata.email,
        telephone: formdata.telephone,
        userId: newUser.id // Link the patient to the newly created user
      }
    });
  }
};

