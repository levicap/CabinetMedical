export const PatientService = {
    getPatientsData() {
        return [
            {
                id: '2000',
                nom: 'Ja',
                prenom: 'Doe',
                adresse: '123 Elm Street',
                email: 'john.doe@example.com',
                telephone: '555-1234'
            },
            {
                id: '2000',
                nom: 'Jn',
                prenom: 'Doe',
                adresse: '123 Elm Street',
                email: 'john.doe@example.com',
                telephone: '555-1234'
            },
            {
                id: '2000',
                nom: 'ap',
                prenom: 'Doe',
                adresse: '123 Elm Street',
                email: 'john.doe@example.com',
                telephone: '555-1234'
            },
            {
                id: '2000',
                nom: 'John',
                prenom: 'Doe',
                adresse: '123 Elm Street',
                email: 'john.doe@example.com',
                telephone: '555-1234'
            },
            {
                id: '2001',
                nom: 'Jane',
                prenom: 'Smith',
                adresse: '456 Oak Avenue',
                email: 'jane.smith@example.com',
                telephone: '555-5678'
            },
            {
                id: '2002',
                nom: 'Michael',
                prenom: 'Johnson',
                adresse: '789 Pine Road',
                email: 'michael.johnson@example.com',
                telephone: '555-9101'
            },
            {
                id: '2003',
                nom: 'Emily',
                prenom: 'Davis',
                adresse: '101 Maple Lane',
                email: 'emily.davis@example.com',
                telephone: '555-1122'
            },
            {
                id: '2004',
                nom: 'William',
                prenom: 'Brown',
                adresse: '202 Birch Boulevard',
                email: 'william.brown@example.com',
                telephone: '555-3344'
            }
        ];
    },

    getPatientsMini() {
        return Promise.resolve(this.getPatientsData().slice(0, 5));
    },

    getPatientsSmall() {
        return Promise.resolve(this.getPatientsData().slice(0, 10));
    },

    getPatients() {
        return Promise.resolve(this.getPatientsData());
    },

    getPatientsWithOrdersSmall() {
        // This method is a placeholder if you have patients with related orders
        // For demonstration, we will just return a slice of the patient data
        return Promise.resolve(this.getPatientsData().slice(0, 10));
    },

    getPatientsWithOrders() {
        // This method is a placeholder if you have patients with related orders
        // For demonstration, we will return all patient data
        return Promise.resolve(this.getPatientsData());
    }
};
