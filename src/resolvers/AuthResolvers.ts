import { User, UserModel } from '../entities/User';
import { Resolver, Mutation, Arg, Ctx, ObjectType, Field } from 'type-graphql';
import { validateEmail, validatePassword, validateUsername } from '../utils/userValidation';
import bcrypt from 'bcryptjs';
import { createToken, sendToken } from '../utils/tokenHanler';
import { AppContext } from '../types';
  

@ObjectType()
export class ResponseMessage {
  @Field()
  message: string;
}


@Resolver()
export class AuthResolvers {

  //Signup User
  @Mutation(() => User, {nullable: true})
  async Signup(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: AppContext
  ): Promise<User | null>{
    try {

      if(!username) throw new Error("Username is required...!");
 
      if(!email) throw new Error("Email is required...!");

      if(!password) throw new Error("Password is required...!");

      //Check validate Username
      const isValidUsername = validateUsername(username);
      if(!isValidUsername) throw new Error("Username must be between 3 to 60 charecters");

      //Validate Email
      const isEmailValid = validateEmail(email);
      if (!isEmailValid) throw new Error("Email is invalid...!");

      //Validate Password
      const isPasswordValid = validatePassword(password);
      if (!isPasswordValid) throw new Error("Password must be between 6 to 75 Charecter");


      //Check exist username
      const isUsername = await UserModel.findOne({ username });
      if(isUsername) throw new Error("username already picked... Try other please?");

      //Check user email is ready exist?
      const isEmail = await UserModel.findOne({ email });
      if(isEmail) throw new Error("This email is already in used... signin instead plz?");

      //hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      const user = await UserModel.create({
        username,
        email,
        password: hashedPassword
      });

      //Create token
      const token = createToken(user.id, user.tokenVersion);

      sendToken(res, token);

      return user;
    } catch (error) {
      throw error
    }
  }


  //Signin user
  @Mutation(() => User, { nullable: true})
  async Signin(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("browser") browser: string,
    @Arg("platform") platform: string,
    @Ctx() { res }: AppContext
  ): Promise<User | null> {
    try {

      if(!email) throw new Error("Email is required...!");
 
      if(!password) throw new Error("Password is required...!");

      const user = await UserModel.findOne({ email });

      if(!user) throw new Error("This email not found, Plz Signup to proceed...!");

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if(!isPasswordValid) throw new Error("Email Or Password is invalid...!1111");

      await user.update({ $set: { browser: browser, platform: platform }});

      const token = createToken(user.id, user.tokenVersion);

      //Send token to frontend
      sendToken(res, token);
      
      user.isOnline = true;

      await user.save();

      return user;


    } catch (error) {
      throw error
    }
  }


  //Signout user
  @Mutation(() => ResponseMessage, { nullable: true })
  async Signout(
    @Ctx() {req, res}: AppContext
  ): Promise<ResponseMessage | null> {
    try {
      const user = await UserModel.findById(req.userId);

      if(!user) return null;

      const date = new Date(Date.now());
      const active_at = date.toLocaleString('en-US');

      await user.update({ $set: { browser: "", platform: "", active_at: active_at }});

      //Bump up token version
      user.tokenVersion = user.tokenVersion + 1;

      //Update isOnline to fale
      user.isOnline = false;

      await user.save();

      //Clear cookies in the browser
      res.clearCookie(process.env.COOKIE_NAME!);

      return { message: "Goodbye ...!" }
    } catch (error) {
      throw error;
    }
  }

  //Request to reset user password


  //Reset user Password
}

