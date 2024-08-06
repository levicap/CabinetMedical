export const UserService = {
    getUserData() {
        return [
            {
                id: '1',
                email: 'john.doe@example.com',
                username: 'johndoe',
                password: 'password123',
                role: 'user'
            },
            {
                id: '2',
                email: 'jane.smith@example.com',
                username: 'janesmith',
                password: 'password123',
                role: 'admin'
            }
        ];
    },

    getUsersMini() {
        return Promise.resolve(this.getUserData().slice(0, 1));
    },

    getUsersSmall() {
        return Promise.resolve(this.getUserData().slice(0, 2));
    },

    getUsers() {
        return Promise.resolve(this.getUserData());
    }
};
