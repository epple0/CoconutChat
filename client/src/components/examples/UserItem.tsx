import { UserItem, type User } from "../chat/UserItem";

const users: User[] = [
  { id: "1", name: "You", isOnline: true },
  { id: "2", name: "Alice", isOnline: true },
  { id: "3", name: "Bob", isOnline: false },
];

export default function UserItemExample() {
  return (
    <div className="flex flex-col gap-1 p-2 bg-sidebar w-56">
      {users.map((user, idx) => (
        <UserItem key={user.id} user={user} isCurrentUser={idx === 0} />
      ))}
    </div>
  );
}
