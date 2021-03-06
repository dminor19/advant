const validateEmail = (email) => {
    const errors = {};

    if (email.trim() == '') {
        errors.email = 'Email must not be empty';
    } else {
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = 'Email must be a valid email address';
        }
    }

    return errors;
};

// TODO: Make the password requirements more strict
const validatePassword = (password) => {
    const errors = {};
    if (password === '') {
        errors.password = 'Password must not be empty';
    }
    return errors;
};

const validateComparePassword = (password, confirmPassword) => {
    const errors = {};

    if (password !== confirmPassword) {
        errors.password = 'Passwords must match';
    }
    const passErrs = validatePassword(password);
    const confPassErrs = validatePassword(confirmPassword);

    return { ...errors, ...passErrs, ...confPassErrs };
};

export const validateRegisterInput = (email, password, confirmPassword) => {
    const emailErrs = validateEmail(email);
    const passErrs = validateComparePassword(password, confirmPassword);

    const errors = { ...emailErrs, ...passErrs };
    return {
        errors,
        valid: Object.keys(errors).length < 1,
    };
};

export const validateLoginInput = (email, password) => {
    const emailErrs = validateEmail(email);
    const passErrs = validatePassword(password);

    const errors = { ...emailErrs, ...passErrs };
    return {
        errors,
        valid: Object.keys(errors).length < 1,
    };
};

export const validateResetPassword = (password, confirmPassword) => {
    const passErrs = validateComparePassword(password, confirmPassword);

    const errors = { ...emailErrs, ...passErrs };
    return {
        errors,
        valid: Object.keys(errors).length < 1,
    };
};

export const validateIncomingEmail = (email) => {
    const errors = validateEmail(email);

    return {
        errors,
        valid: Object.keys(errors).length < 1,
    };
};
