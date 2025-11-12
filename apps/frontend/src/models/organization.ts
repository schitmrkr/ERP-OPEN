export interface Organization {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
}

export interface UpdateOrganizationDto {
  name?: string;
}

