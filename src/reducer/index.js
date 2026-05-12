import { combineReducers } from "redux";
import userDataSlice from "./userDataSlice";
import filmDataSlice from "./filmDataSlice";

const initialWebsiteState = {
  data: null,
};

const websiteReducer = (state = initialWebsiteState, action) => {
  switch (action.type) {
    case "SET_WEBSITE_DATA":
      return {
        ...state,
        data: action.payload,
      };
    default:
      return state;
  }
};
// const UserReducer = (state = initialWebsiteState, action) => {
//   console.log(action)
//   switch (action.type) {
//     case "SET_USER_DATA":
//       console.log("test");
//       return {
//         data: action.payload,
//       };
//     default:
//       return state;
//   }
// };

const rootReducer = combineReducers({
  website: websiteReducer,
  // user: UserReducer
  user: userDataSlice,
  filmData: filmDataSlice,
});

export default rootReducer;
