export class AgentObject extends EventTarget {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  bio: string;
  previewUrl: string;
  model: string;
  address: string;
  stripeConnectAccountId: string;

  constructor({
    id,
    ownerId,
    name,
    description,
    bio,
    previewUrl,
    model,
    address,
    stripeConnectAccountId,
  }: {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    bio: string;
    previewUrl: string;
    model: string;
    address: string;
    stripeConnectAccountId: string;
  }) {
    super();

    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    this.description = description;
    this.bio = bio;
    this.previewUrl = previewUrl;
    this.model = model;
    this.address = address;
    this.stripeConnectAccountId = stripeConnectAccountId;
  }
}