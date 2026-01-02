// Import all models to ensure they are registered with Mongoose
import './user';
import './event';
import './Organization';
import './registration';
import './blogPost';
import './blogComment';
import './certificate';

// Import models
import User, { IUser } from './user';
import Event, { IEvent } from './event';
import Organization, { IOrganization } from './Organization';
import Registration, { IRegistration } from './registration';
import BlogPost, { IBlogPost } from './blogPost';
import BlogComment, { IBlogComment } from './blogComment';
import Certificate, { ICertificate } from './certificate';

// Export all models
export {
  User,
  Event,
  Organization,
  Registration,
  BlogPost,
  BlogComment,
  Certificate,
  type IUser,
  type IEvent,
  type IOrganization,
  type IRegistration,
  type IBlogPost,
  type IBlogComment,
  type ICertificate,
};
