// Import all models to ensure they are registered with Mongoose
import './user';
import './event';
import './Organization';
import './registration';

// Import models
import User, { IUser } from './user';
import Event, { IEvent } from './event';
import Organization, { IOrganization } from './Organization';
import Registration, { IRegistration } from './registration';

// Export all models
export {
  User,
  Event,
  Organization,
  Registration,
  type IUser,
  type IEvent,
  type IOrganization,
  type IRegistration
};
