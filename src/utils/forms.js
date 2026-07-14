export const newsletterSchema = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email address.',
};

export const contactSchema = {
  name: (value) => value.trim().length >= 2 || 'Please enter your name.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email address.',
  message: (value) => value.trim().length >= 10 || 'Please share a little more detail.',
};

export const volunteerSchema = {
  name: (value) => value.trim().length >= 2 || 'Please enter your name.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email address.',
  phone: (value) => value.trim().length >= 7 || 'Please enter a valid phone number.',
  message: (value) => value.trim().length >= 10 || 'Please tell us a bit more about yourself.',
};
