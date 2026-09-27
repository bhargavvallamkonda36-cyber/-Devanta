from pydantic import BaseModel, ConfigDict, EmailStr


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    name: str | None = None
    bio: str | None = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    github_url: str | None = None
    twitter_url: str | None = None
    website_url: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    