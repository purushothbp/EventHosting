// Import all models to ensure they are registered with Mongoose
import './user';
import './event';
import './organization';

// Import models
import User, { IUser } from './user';
import Event, { IEvent } from './event';
import Organization, { IOrganization } from './organization';

// Export all models
export {
  User,
  Event,
  Organization,
  type IUser,
  type IEvent,
  type IOrganization
};