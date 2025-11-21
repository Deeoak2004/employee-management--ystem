from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app import database, models, schemas

router = APIRouter(prefix="/auth", tags=["Auth"])


SECRET_KEY = "secret"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")



def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)



def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user



@router.post("/login")
def login(request: schemas.Login, db: Session = Depends(database.get_db)):
    
    user = db.query(models.User).filter(models.User.email == request.email).first()
    
    
    if not user:
        raise HTTPException(status_code=401, detail="  Please enter the correct email ")
    
    
    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail=" Please enter the correct password")
    
    # 4. Token generate karo
    token = create_access_token({"sub": user.email, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role
    }
