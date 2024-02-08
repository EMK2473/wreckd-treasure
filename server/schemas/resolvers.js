const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

//resolvers - functions that actually execute the queries and mutations
const resolvers = {
  //query - get user data
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const data = await User.findOne({ _id: context.user._id })
        .select("-__v -password");
        return data;
      } else {
        throw AuthenticationError;
      }
    },
  },

  //mutation - hook that handles server-side mutations to create/update/delete data or perform server-side-effects
  Mutation: {
    //create user
    //addUser(username: String!, email: String!, password: String!): Auth
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    //login
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      //check username credentials
      if (!user) {
        throw AuthenticationError;
      }
      //check password credentials
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError();
      }
      //auth token
      const token = signToken(user);
      console.log("Logged IN");
      return { token, user };
    },

    //logout
    logout: async (parent, args, context) => {
      if (context.user) {
        context.user = null;
        return { success: true, message: "Logout Successful" };
      } else {
        throw AuthenticationError;
      }
    },

    //update user - save shipwreck
    //saveShipWreck(newShipWreck: ShipWreckInput): User
    saveShipWreck: async (parent, { newShipWreck }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedShipWrecks: newShipWreck } },
          { new: true }
        );
        return updatedUser;
      }
      throw AuthenticationError;
    },

    //remove shipwreck
    //removeShipWreck(shipWreckId: ID!): User
    removeShipWreck: async (parent, { shipWreckId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedShipWrecks: { shipWreckId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw AuthenticationError;
    },
  },
};

module.exports = resolvers;
