// The life of an e-cash request, step by step.
export enum RequestStatus {
  PENDING = 'pending', // agent just asked for e-cash
  ACCEPTED = 'accepted', // a coordinator said "I'll handle this"
  FULFILLED = 'fulfilled', // the coordinator actually sent the e-cash
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}
