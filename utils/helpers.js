import { conf } from "../config.js";

export const paramRequired = () => {
    throw new Error("Parameter is required.");
};

export const generateUsername = () => {
    const min = 0,
        max = conf.random_usernames.length - 1;
    const ran_index = Math.floor(Math.random() * (max - min + 1));
    return conf.random_usernames[ran_index];
};
