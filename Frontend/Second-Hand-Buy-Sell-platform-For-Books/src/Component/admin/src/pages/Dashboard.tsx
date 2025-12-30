// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// const stats = [
//   { title: 'Books Listed', value: '18', change: '+300 from last month' },
//   { title: 'Total Users', value: '18', change: '+12% from last month' },
//   { title: 'Organization', value: '18', change: '+2 new this month' },
//   { title: 'Unread messages', value: '18', change: '5 new today' },
// ];

// const recentMessages = [
//   {
//     name: 'Saurab Doe',
//     message: "I'm interested in the harry porter collection",
//     time: '5m ago'
//   }
// ];

// const chartData = [
//   { month: 'Jan', books: 186, users: 80, donations: 45 },
//   { month: 'Feb', books: 305, users: 200, donations: 78 },
//   { month: 'Mar', books: 237, users: 120, donations: 52 },
//   { month: 'Apr', books: 73, users: 190, donations: 98 },
//   { month: 'May', books: 209, users: 130, donations: 63 },
//   { month: 'Jun', books: 214, users: 140, donations: 87 },
// ];

// const categoryData = [
//   { name: 'Fiction', value: 400, color: 'hsl(var(--primary))' },
//   { name: 'Non-Fiction', value: 300, color: 'hsl(var(--secondary))' },
//   { name: 'Academic', value: 200, color: 'hsl(var(--accent))' },
//   { name: 'Children', value: 100, color: 'hsl(var(--muted))' },
// ];

// const userGrowthData = [
//   { month: 'Jan', users: 1200 },
//   { month: 'Feb', users: 1400 },
//   { month: 'Mar', users: 1350 },
//   { month: 'Apr', users: 1600 },
//   { month: 'May', users: 1750 },
//   { month: 'Jun', users: 1890 },
// ];

// const chartConfig = {
//   books: {
//     label: "Books",
//     color: "hsl(var(--primary))",
//   },
//   users: {
//     label: "Users",
//     color: "hsl(var(--secondary))",
//   },
//   donations: {
//     label: "Donations",
//     color: "hsl(var(--accent))",
//   },
// };

// export default function Dashboard() {
//   const [activeTab, setActiveTab] = useState('Overview');
//   const tabs = ['Overview', 'Analytics', 'Reports'];

//   return (
//     // <div className="space-y-6">
//     //   <div>
//     //     <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
//     //   </div>

//     //   {/* Stats Cards */}
//     //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//     //     {stats.map((stat, index) => (
//     //       <div key={index} className="bg-card border border-border rounded-lg p-6">
//     //         <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
//     //         <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
//     //         <p className="text-sm text-muted-foreground mt-1">{stat.change}</p>
//     //       </div>
//     //     ))}
//     //   </div>

//     //   {/* Tabs */}
//     //   <div className="border-b border-border">
//     //     <nav className="-mb-px flex space-x-8">
//     //       {tabs.map((tab) => (
//     //         <button
//     //           key={tab}
//     //           onClick={() => setActiveTab(tab)}
//     //           className={`py-2 px-1 border-b-2 font-medium text-sm ${
//     //             activeTab === tab
//     //               ? 'border-primary text-primary'
//     //               : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
//     //           }`}
//     //         >
//     //           {tab}
//     //         </button>
//     //       ))}
//     //     </nav>
//     //   </div>

//     //   {/* Content */}
//     //   {activeTab === 'Overview' && (
//     //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//     //       {/* Recent Activity */}
//     //       <div className="bg-card border border-border rounded-lg p-6">
//     //         <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
//     //         <div className="h-64 flex items-center justify-center text-muted-foreground">
//     //           No recent activity to display
//     //         </div>
//     //       </div>

//     //       {/* Recent Messages */}
//     //       <div className="bg-card border border-border rounded-lg p-6">
//     //         <h3 className="text-lg font-semibold text-foreground mb-4">Recent Messages</h3>
//     //         <div className="space-y-4">
//     //           <p className="text-sm text-muted-foreground">You have 28 unread messages</p>
//     //           {recentMessages.map((msg, index) => (
//     //             <div key={index} className="border-b border-border pb-3">
//     //               <div className="flex justify-between items-start">
//     //                 <div>
//     //                   <p className="font-medium text-foreground">{msg.name}</p>
//     //                   <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
//     //                 </div>
//     //                 <span className="text-xs text-muted-foreground">{msg.time}</span>
//     //               </div>
//     //             </div>
//     //           ))}
//     //         </div>
//     //       </div>
//     //     </div>
//     //   )}

//     //   {activeTab === 'Analytics' && (
//     //     <div className="space-y-6">
//     //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Books & Users Chart */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Monthly Overview</CardTitle>
//                 <CardDescription>Books listed and user registrations over time</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ChartContainer config={chartConfig} className="h-[300px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={chartData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis />
//                       <ChartTooltip content={<ChartTooltipContent />} />
//                       <Bar dataKey="books" fill="hsl(var(--primary))" />
//                       <Bar dataKey="users" fill="hsl(var(--secondary))" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </ChartContainer>
//               </CardContent>
//             </Card>

//             {/* User Growth Chart */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Growth</CardTitle>
//                 <CardDescription>Total registered users over time</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ChartContainer config={chartConfig} className="h-[300px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={userGrowthData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis />
//                       <ChartTooltip content={<ChartTooltipContent />} />
//                       <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </ChartContainer>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Book Categories */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Book Categories</CardTitle>
//                 <CardDescription>Distribution of books by category</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ChartContainer config={chartConfig} className="h-[300px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={categoryData}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                         outerRadius={80}
//                         fill="#8884d8"
//                         dataKey="value"
//                       >
//                         {categoryData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <ChartTooltip content={<ChartTooltipContent />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </ChartContainer>
//               </CardContent>
//             </Card>

//             {/* Key Metrics */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Key Metrics</CardTitle>
//                 <CardDescription>Important performance indicators</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">Active Users</span>
//                   <span className="text-2xl font-bold text-primary">1,234</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">Books Exchanged</span>
//                   <span className="text-2xl font-bold text-secondary">567</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">Avg. Response Time</span>
//                   <span className="text-2xl font-bold text-accent">2.3h</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">Success Rate</span>
//                   <span className="text-2xl font-bold text-primary">94%</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}

//       {activeTab === 'Reports' && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Report Cards */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Monthly Report</CardTitle>
//                 <CardDescription>Comprehensive monthly analytics</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm">Books Listed</span>
//                     <span className="font-semibold">1,456</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">New Users</span>
//                     <span className="font-semibold">234</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">Donations</span>
//                     <span className="font-semibold">89</span>
//                   </div>
//                 </div>
//                 <button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
//                   Download Report
//                 </button>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>User Activity Report</CardTitle>
//                 <CardDescription>User engagement and activity metrics</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm">Daily Active Users</span>
//                     <span className="font-semibold">456</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">Page Views</span>
//                     <span className="font-semibold">12,345</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">Session Duration</span>
//                     <span className="font-semibold">4.2m</span>
//                   </div>
//                 </div>
//                 <button className="w-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md text-sm">
//                   View Details
//                 </button>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Financial Report</CardTitle>
//                 <CardDescription>Revenue and transaction analytics</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm">Total Revenue</span>
//                     <span className="font-semibold">$2,456</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">Transactions</span>
//                     <span className="font-semibold">123</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">Avg. Order Value</span>
//                     <span className="font-semibold">$19.97</span>
//                   </div>
//                 </div>
//                 <button className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md text-sm">
//                   Export Data
//                 </button>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Detailed Analytics Table */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Detailed Analytics</CardTitle>
//               <CardDescription>Comprehensive data breakdown</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b">
//                       <th className="text-left p-2">Date</th>
//                       <th className="text-left p-2">Books Listed</th>
//                       <th className="text-left p-2">New Users</th>
//                       <th className="text-left p-2">Messages</th>
//                       <th className="text-left p-2">Donations</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr className="border-b">
//                       <td className="p-2">2024-01-15</td>
//                       <td className="p-2">45</td>
//                       <td className="p-2">12</td>
//                       <td className="p-2">67</td>
//                       <td className="p-2">8</td>
//                     </tr>
//                     <tr className="border-b">
//                       <td className="p-2">2024-01-14</td>
//                       <td className="p-2">52</td>
//                       <td className="p-2">18</td>
//                       <td className="p-2">89</td>
//                       <td className="p-2">12</td>
//                     </tr>
//                     <tr className="border-b">
//                       <td className="p-2">2024-01-13</td>
//                       <td className="p-2">38</td>
//                       <td className="p-2">9</td>
//                       <td className="p-2">45</td>
//                       <td className="p-2">6</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }