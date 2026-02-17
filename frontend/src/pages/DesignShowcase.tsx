import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Badge,
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

export default function DesignShowcase() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold text-text-primary mb-3">Design System Showcase</h1>
        <p className="text-xl text-text-tertiary">
          A comprehensive demonstration of all available components and styles
        </p>
      </div>

      {/* Colors Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Colors</h2>
          <p className="text-text-tertiary">Our sophisticated color palette</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-primary-600 flex items-center justify-center text-white font-semibold">
              Primary
            </div>
            <p className="text-sm text-text-tertiary">#2563EB</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-success flex items-center justify-center text-white font-semibold">
              Success
            </div>
            <p className="text-sm text-text-tertiary">#10B981</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-warning flex items-center justify-center text-white font-semibold">
              Warning
            </div>
            <p className="text-sm text-text-tertiary">#F59E0B</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-danger flex items-center justify-center text-white font-semibold">
              Danger
            </div>
            <p className="text-sm text-text-tertiary">#EF4444</p>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Typography</h2>
          <p className="text-text-tertiary">Our type scale and hierarchy</p>
        </div>

        <Card>
          <CardBody className="space-y-4">
            <h1 className="text-5xl font-bold">Heading 1 - Hero</h1>
            <h2 className="text-4xl font-bold">Heading 2 - Page Title</h2>
            <h3 className="text-3xl font-bold">Heading 3 - Section</h3>
            <h4 className="text-2xl font-semibold">Heading 4 - Card Title</h4>
            <h5 className="text-xl font-semibold">Heading 5 - Subheading</h5>
            <p className="text-base">Body text - The quick brown fox jumps over the lazy dog</p>
            <p className="text-sm">Small text - The quick brown fox jumps over the lazy dog</p>
            <p className="text-xs">Caption - The quick brown fox jumps over the lazy dog</p>
          </CardBody>
        </Card>
      </section>

      {/* Buttons Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Buttons</h2>
          <p className="text-text-tertiary">All button variants and sizes</p>
        </div>

        <Card>
          <CardBody className="space-y-6">
            {/* Variants */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h4 className="text-lg font-semibold mb-4">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Badges Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Badges</h2>
          <p className="text-text-tertiary">Status indicators and labels</p>
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Success
              </Badge>
              <Badge variant="warning">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                Warning
              </Badge>
              <Badge variant="danger">
                <XCircleIcon className="w-3.5 h-3.5" />
                Danger
              </Badge>
              <Badge variant="info">
                <InformationCircleIcon className="w-3.5 h-3.5" />
                Info
              </Badge>
              <Badge variant="primary" dot>
                New
              </Badge>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Stat Cards Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Stat Cards</h2>
          <p className="text-text-tertiary">Dashboard statistics and metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value="$45,231"
            change={12.5}
            trend="up"
            changeLabel="vs last month"
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Total Orders"
            value="1,234"
            change={-3.2}
            trend="down"
            changeLabel="vs last month"
            icon={<ShoppingCartIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Customers"
            value="5,678"
            change={8.1}
            trend="up"
            changeLabel="vs last month"
            icon={<UsersIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Conversion"
            value="3.2%"
            change={0.5}
            trend="up"
            changeLabel="vs last month"
            icon={<ChartBarIcon className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Cards</h2>
          <p className="text-text-tertiary">Container components with variants</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <CardHeader>
              <h4 className="text-lg font-semibold">Standard Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary">
                A standard card with hover effect. Perfect for most use cases.
              </p>
            </CardBody>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card glass hover>
            <CardHeader>
              <h4 className="text-lg font-semibold">Glass Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary">
                A glassmorphism card with backdrop blur effect.
              </p>
            </CardBody>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card gradient hover>
            <CardHeader>
              <h4 className="text-lg font-semibold">Gradient Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary">
                A card with subtle gradient background.
              </p>
            </CardBody>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Forms Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Forms</h2>
          <p className="text-text-tertiary">Input fields and form elements</p>
        </div>

        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold">Sample Form</h4>
          </CardHeader>
          <CardBody>
            <form className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                required
                helperText="We'll never share your email"
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
              />

              <Input
                label="Error State"
                type="text"
                error
                helperText="This field has an error"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                />
              </div>
            </form>
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary">Submit</Button>
          </CardFooter>
        </Card>
      </section>

      {/* Table Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Tables</h2>
          <p className="text-text-tertiary">Data tables with sorting and actions</p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">John Doe</TableCell>
                <TableCell>john@example.com</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">Edit</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jane Smith</TableCell>
                <TableCell>jane@example.com</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">Edit</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bob Johnson</TableCell>
                <TableCell>bob@example.com</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>
                  <Badge variant="warning">Pending</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">Edit</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* Animations Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Animations</h2>
          <p className="text-text-tertiary">Smooth transitions and effects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardBody className="text-center">
              <p className="font-semibold mb-2">Fade In</p>
              <p className="text-sm text-text-tertiary">animate-fade-in</p>
            </CardBody>
          </Card>

          <Card className="animate-fade-in-up">
            <CardBody className="text-center">
              <p className="font-semibold mb-2">Fade In Up</p>
              <p className="text-sm text-text-tertiary">animate-fade-in-up</p>
            </CardBody>
          </Card>

          <Card className="hover-lift">
            <CardBody className="text-center">
              <p className="font-semibold mb-2">Hover Lift</p>
              <p className="text-sm text-text-tertiary">hover-lift</p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Loading States Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Loading States</h2>
          <p className="text-text-tertiary">Skeleton loaders and spinners</p>
        </div>

        <Card>
          <CardBody className="space-y-4">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-10 w-1/2" />
            <div className="flex items-center gap-3 mt-6">
              <div className="spinner w-8 h-8" />
              <span className="text-text-tertiary">Loading...</span>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  )
}
