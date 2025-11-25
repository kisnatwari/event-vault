export interface ClientDevice {
    id: number;
    name: string;
    mac_address: string;
}

export interface ApiToken {
    id: number;
    name: string;
    last_used_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
}

export interface ClientWithDevices {
    id: number;
    name: string;
    webhook_url: string | null;
    devices: ClientDevice[];
    api_tokens?: ApiToken[];
}

