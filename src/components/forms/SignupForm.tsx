'use client';

import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface SignupFormProps {
  onSubmit: (values: { name: string; email: string; password: string }) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit }) => (
  <>
    <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>
    <Formik
      initialValues={{ name: '', email: '', password: '' }}
      validationSchema={Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
      })}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-300 p-2 rounded"
              value={formik.values.name}
              onChange={formik.handleChange}
              placeholder="username"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-600">{formik.errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border border-gray-300 p-2 rounded"
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="example@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-600">{formik.errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="w-full border border-gray-300 p-2 rounded"
              value={formik.values.password}
              onChange={formik.handleChange}
              placeholder="********"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-600">{formik.errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-[#f85606] text-white p-2 rounded hover:bg-[#e94c00]"
          >
            Sign Up
          </button>
        </form>
      )}
    </Formik>
  </>
);

export default SignupForm;
