import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from '../lib/prisma.js'

const opts = {
    // Extract token from: Authorization: Bearer <TOKEN>
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'secret',
};

export default function configurePassport(passport) {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                // Find the user using the ID stored inside the token payload
                const user = await prisma.user.findUnique({
                    where: { id: jwt_payload.id },
                });

                if (user) {
                    // Removes password before passing it to the req.user
                    const { password, ...userWithoutPassword } = user;
                    return done(null, userWithoutPassword);
                }

                return done(null, false);
            } catch (err) {
                return done(err, false)
            }
        })
    );
};