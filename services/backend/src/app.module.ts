import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { MongodbModule } from './mongodb/mongodb.module';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { ProductController } from './controllers/product.controller';
import { SalesController } from './controllers/sales.controller';
import { CustomersController } from './controllers/customers.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { StaffController } from './controllers/staff.controller';
import { SettingsController } from './controllers/settings.controller';
import { InventoryController } from './controllers/inventory.controller';
import { LedgerController } from './controllers/ledger.controller';
import { ExpensesController } from './controllers/expenses.controller';
import { AccountsController } from './controllers/accounts.controller';
import { InvestmentsController } from './controllers/investments.controller';
import { TransactionsController } from './controllers/transactions.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { AiController } from './controllers/ai.controller';
import { SystemAdminController } from './controllers/system-admin.controller';
import { LogisticsController } from './controllers/logistics.controller';
import { UtilitiesController } from './controllers/utilities.controller';
import { ReportsController } from './controllers/reports.controller';
import { CommsController } from './controllers/comms.controller';
import { RegistrationController } from './controllers/registration.controller';
import { HealthController } from './controllers/health.controller';

// Services
import { AuthService } from './services/auth.service';
import { ProductService } from './services/product.service';
import { SalesService } from './services/sales.service';
import { AuditService } from './services/audit.service';
import { CustomersService } from './services/customers.service';
import { SuppliersService } from './services/suppliers.service';
import { StaffService } from './services/staff.service';
import { SettingsService } from './services/settings.service';
import { InventoryService } from './services/inventory.service';
import { LedgerService } from './services/ledger.service';
import { ExpensesService } from './services/expenses.service';
import { AccountsService } from './services/accounts.service';
import { InvestmentsService } from './services/investments.service';
import { TransactionsService } from './services/transactions.service';
import { AnalyticsService } from './services/analytics.service';
import { AiService } from './services/ai.service';
import { SystemAdminService } from './services/system-admin.service';
import { LogisticsService } from './services/logistics.service';
import { UtilitiesService } from './services/utilities.service';
import { ReportsService } from './services/reports.service';
import { CommsService } from './services/comms.service';
import { HealthService } from './services/health.service';

@Module({
  imports: [DatabaseModule, MongodbModule],
  controllers: [
    AppController,
    AuthController,
    ProductController,
    SalesController,
    CustomersController,
    SuppliersController,
    StaffController,
    SettingsController,
    InventoryController,
    LedgerController,
    ExpensesController,
    AccountsController,
    InvestmentsController,
    TransactionsController,
    AnalyticsController,
    AiController,
    SystemAdminController,
    LogisticsController,
    UtilitiesController,
    ReportsController,
    CommsController,
    RegistrationController,
    HealthController,
  ],
  providers: [
    AppService,
    AuthService,
    ProductService,
    SalesService,
    AuditService,
    CustomersService,
    SuppliersService,
    StaffService,
    SettingsService,
    InventoryService,
    LedgerService,
    ExpensesService,
    AccountsService,
    InvestmentsService,
    TransactionsService,
    AnalyticsService,
    AiService,
    SystemAdminService,
    LogisticsService,
    UtilitiesService,
    ReportsService,
    CommsService,
    HealthService,
  ],
})
export class AppModule {}
