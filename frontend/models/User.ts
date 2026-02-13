export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const createUser = (data: {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
}): User => ({
  id: data.id,
  name: data.name,
  email: data.email,
  avatarUrl: data.avatarUrl,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

export const userFromJson = (json: any): User => ({
  id: String(json.id),
  name: String(json.name),
  email: String(json.email),
  avatarUrl: json.avatarUrl ? String(json.avatarUrl) : undefined,
  createdAt: new Date(json.createdAt),
  updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
});

export const userToJson = (user: User): Record<string, unknown> => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt?.toISOString(),
});