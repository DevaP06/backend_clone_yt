import mongoose, { Types } from "mongoose";



const subscriptionSchema = new mongoose.Schema(
    {
        subscriber:{
            Types: Types.ObjectId,//one who is sbscribing
            ref: 'User'
        },
        channel:{
            types: Types.ObjectId,//channel being subscribed to
            ref: 'User'
        },
    },
    {
        timestamps: true
    }

)





export const Subscription = mongoose.model("Subscription", subscriptionSchema);