import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function RecentClients({
  clients,
  getInitials,
  getStatusBadge,
  formatCurrency,
}) {
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden w-full">
      <CardHeader className="p-4 border-b flex justify-between items-center sticky top-0 z-20 bg-white dark:bg-background">
        <CardTitle className="text-lg sm:text-xl font-semibold">
          Recent Clients
        </CardTitle>
      </CardHeader>

      {clients.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No clients found
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[60vh]">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {clients.slice(0, 5).map((client) => (
                <TableRow key={client._id}>
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {client.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {client.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.companyName || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        client.status
                      )}`}
                    >
                      {client.status.charAt(0).toUpperCase() +
                        client.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {formatCurrency(client.value || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
