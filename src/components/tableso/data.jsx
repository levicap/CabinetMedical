export const PrescriptionService = {
    getPrescriptionData() {
        return [
            {
                id: '1',
                patientName: 'John Doe',
                doctorName: 'Dr. Smith',
                date: '2024-08-10',
                medication: 'Paracetamol',
                dosage: '500mg',
                instructions: 'Take one tablet every 8 hours'
            },
            {
                id: '2',
                patientName: 'Jane Smith',
                doctorName: 'Dr. Brown',
                date: '2024-08-11',
                medication: 'Ibuprofen',
                dosage: '200mg',
                instructions: 'Take one tablet every 6 hours after food'
            },
            // Add more data as needed
        ];
    },

    getPrescriptionMini() {
        return Promise.resolve(this.getPrescriptionData().slice(0, 5));
    },

    getPrescriptionSmall() {
        return Promise.resolve(this.getPrescriptionData().slice(0, 10));
    },

    getPrescriptions() {
        return Promise.resolve(this.getPrescriptionData());
    }
};
