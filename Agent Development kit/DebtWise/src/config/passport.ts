import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Profile:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    // Check if user already exists with this Google ID
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (user) {
      console.log('Existing user found by Google ID:', user.email);
      return done(null, user);
    }

    // Check if user exists with this email
    const email = profile.emails?.[0]?.value;
    if (!email) {
      console.error('No email provided by Google');
      return done(new Error('No email provided by Google'), undefined);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Linking Google account to existing user:', email);
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { email },
        data: {
          googleId: profile.id,
          picture: profile.photos?.[0]?.value,
          verified: true
        }
      });
      return done(null, user);
    }

    console.log('Creating new user:', email);
    // Create new user
    user = await prisma.user.create({
      data: {
        googleId: profile.id,
        email,
        name: profile.displayName || 'Unknown',
        picture: profile.photos?.[0]?.value,
        verified: true,
        monthlyIncome: 0, // Default values - user will set these later
        monthlyExpenses: 0
      }
    });

    console.log('New user created:', user.email);
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error as Error, undefined);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;