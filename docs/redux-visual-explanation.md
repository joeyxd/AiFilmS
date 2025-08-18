```
FilmStudio AI - Redux Architecture

┌─────────────────────────────────────────────────────────────┐
│                    REDUX STORE (Global State)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────┐ │
│  │ auth slice  │  │projects     │  │editor slice │  │ui   │ │
│  │             │  │slice        │  │             │  │slice│ │
│  │• user       │  │• projects[] │  │• timeline   │  │• UI │ │
│  │• isLoading  │  │• current    │  │• tracks[]   │  │state│ │
│  │• error      │  │• loading    │  │• clips[]    │  │     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Dashboard   │    │ ProjectList  │    │VideoEditor   │   │
│  │              │    │              │    │              │   │
│  │useAppSelector│    │useAppSelector│    │useAppSelector│   │
│  │(auth.user)   │    │(projects)    │    │(editor)      │   │
│  │              │    │              │    │              │   │
│  │useAppDispatch│    │useAppDispatch│    │useAppDispatch│   │
│  │(signOut)     │    │(createProj)  │    │(addClip)     │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  users   │  │projects  │  │timelines │  │  clips   │     │
│  │profiles  │  │stories   │  │tracks    │  │  shots   │     │
│  │          │  │chapters  │  │          │  │          │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

DATA FLOW:
1. User Action (click button) 
   ↓
2. Component dispatches action
   ↓  
3. Redux slice updates state
   ↓
4. Database sync (if needed)
   ↓
5. All components re-render with new state
```

## Simple Example - User Login Flow

```
Step 1: User types email/password and clicks "Sign In"
   ↓
Step 2: Login component dispatches action
   dispatch(signIn({email: "user@email.com", password: "pass123"}))
   ↓
Step 3: Auth slice receives action
   - Sets isLoading = true
   - Calls Supabase authentication
   - If success: stores user data
   - If error: stores error message
   ↓
Step 4: All components using auth state automatically update
   - Login form shows spinner (isLoading = true)
   - Navigation shows user name (user.username)
   - Dashboard loads user's projects
```

## Real Code Example from our FilmStudio AI:

```typescript
// In Login component:
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // This dispatches to Redux store
  await dispatch(signIn({ email, password }))
  
  // Redux automatically handles:
  // 1. Loading states
  // 2. API calls to Supabase  
  // 3. Storing user data
  // 4. Error handling
}

// In Dashboard component:
const { user, isLoading } = useAppSelector(state => state.auth)

// Component automatically re-renders when auth state changes
return (
  <div>
    {isLoading ? (
      <Spinner />
    ) : (
      <h1>Welcome back, {user?.username}!</h1>
    )}
  </div>
)
```
