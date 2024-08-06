export const DiagnosisService = {
    getDiagnosisData() {
        return [
            {
                id: '1',
                patientName: 'Doe John',
                date: '2024-08-10',
                diagnosis: 'Common Cold',
                notes: 'Rest and drink plenty of fluids.'
            },
            {
                id: '2',
                patientName: 'Smith Jane',
                date: '2024-08-11',
                diagnosis: 'Sprained Ankle',
                notes: 'Apply ice and keep the ankle elevated.'
            },
            // Add more data as needed
        ];
    },

    getDiagnosisMini() {
        return Promise.resolve(this.getDiagnosisData().slice(0, 5));
    },

    getDiagnosisSmall() {
        return Promise.resolve(this.getDiagnosisData().slice(0, 10));
    },

    getDiagnosis() {
        return Promise.resolve(this.getDiagnosisData());
    }
};
