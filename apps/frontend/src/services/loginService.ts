import type { LoginDto, LoginResponse } from '../models/login'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const loginUser = async (dto: LoginDto): Promise<LoginResponse> => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
    });

    const data = await res.json(); 

    if (!res.ok) {
        throw data;
    }

    return data;
};


