import { PrismaClient, Role, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  // await prisma.user.deleteMany();

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'John Doe',
      role: Role.USER,
    },
  });

  const anotherUser = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: Role.USER,
    },
  });

  console.log(`✅ Created ${3} users`);

  // Create categories for regularUser
  console.log('📁 Creating categories...');
  const incomeCategories = [
    { name: 'Salary', color: '#22c55e' },
    { name: 'Freelance', color: '#3b82f6' },
    { name: 'Investment', color: '#10b981' },
    { name: 'Bonus', color: '#14b8a6' },
  ];

  const expenseCategories = [
    { name: 'Food & Dining', color: '#ef4444' },
    { name: 'Transportation', color: '#f59e0b' },
    { name: 'Shopping', color: '#8b5cf6' },
    { name: 'Bills & Utilities', color: '#ec4899' },
    { name: 'Entertainment', color: '#f97316' },
    { name: 'Healthcare', color: '#06b6d4' },
    { name: 'Education', color: '#6366f1' },
    { name: 'Travel', color: '#84cc16' },
  ];

  const userCategories = [];

  // Create income categories
  for (const cat of incomeCategories) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        type: TransactionType.INCOME,
        userId: regularUser.id,
        color: cat.color,
      },
    });
    userCategories.push(category);
  }

  // Create expense categories
  for (const cat of expenseCategories) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        type: TransactionType.EXPENSE,
        userId: regularUser.id,
        color: cat.color,
      },
    });
    userCategories.push(category);
  }

  // Create categories for anotherUser
  const anotherUserIncomeCat = await prisma.category.create({
    data: {
      name: 'Salary',
      type: TransactionType.INCOME,
      userId: anotherUser.id,
      color: '#22c55e',
    },
  });

  const anotherUserExpenseCat = await prisma.category.create({
    data: {
      name: 'Food & Dining',
      type: TransactionType.EXPENSE,
      userId: anotherUser.id,
      color: '#ef4444',
    },
  });

  console.log(`✅ Created ${userCategories.length + 2} categories`);

  // Get category IDs for easier reference
  const salaryCategory = userCategories.find((c) => c.name === 'Salary')!;
  const freelanceCategory = userCategories.find((c) => c.name === 'Freelance')!;
  const foodCategory = userCategories.find((c) => c.name === 'Food & Dining')!;
  const transportCategory = userCategories.find((c) => c.name === 'Transportation')!;
  const shoppingCategory = userCategories.find((c) => c.name === 'Shopping')!;
  const billsCategory = userCategories.find((c) => c.name === 'Bills & Utilities')!;
  const entertainmentCategory = userCategories.find((c) => c.name === 'Entertainment')!;
  const healthcareCategory = userCategories.find((c) => c.name === 'Healthcare')!;

  // Create transactions for regularUser
  console.log('💰 Creating transactions...');
  const now = new Date();
  const transactions = [];

  // Income transactions (last 6 months)
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Monthly salary
    transactions.push({
      userId: regularUser.id,
      categoryId: salaryCategory.id,
      type: TransactionType.INCOME,
      amount: 5000 + Math.random() * 500,
      title: 'Monthly Salary',
      description: `Salary for ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      date: date,
    });

    // Occasional freelance work
    if (i % 2 === 0) {
      transactions.push({
        userId: regularUser.id,
        categoryId: freelanceCategory.id,
        type: TransactionType.INCOME,
        amount: 800 + Math.random() * 400,
        title: 'Freelance Project',
        description: 'Web development project',
        date: new Date(date.getFullYear(), date.getMonth(), 15 + Math.floor(Math.random() * 10)),
      });
    }
  }

  // Expense transactions (various dates)
  const expenseData = [
    { category: foodCategory, title: 'Grocery Shopping', amount: 150, count: 20 },
    { category: foodCategory, title: 'Restaurant', amount: 45, count: 15 },
    { category: transportCategory, title: 'Gas', amount: 60, count: 12 },
    { category: transportCategory, title: 'Uber Ride', amount: 25, count: 8 },
    { category: shoppingCategory, title: 'Clothing', amount: 120, count: 5 },
    { category: shoppingCategory, title: 'Electronics', amount: 300, count: 3 },
    { category: billsCategory, title: 'Electric Bill', amount: 120, count: 6 },
    { category: billsCategory, title: 'Internet Bill', amount: 80, count: 6 },
    { category: billsCategory, title: 'Water Bill', amount: 50, count: 6 },
    { category: entertainmentCategory, title: 'Movie Tickets', amount: 30, count: 4 },
    { category: entertainmentCategory, title: 'Concert', amount: 150, count: 2 },
    { category: healthcareCategory, title: 'Pharmacy', amount: 40, count: 5 },
    { category: healthcareCategory, title: 'Doctor Visit', amount: 200, count: 2 },
  ];

  for (const expense of expenseData) {
    for (let i = 0; i < expense.count; i++) {
      const monthsAgo = Math.floor(Math.random() * 6);
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
      
      transactions.push({
        userId: regularUser.id,
        categoryId: expense.category.id,
        type: TransactionType.EXPENSE,
        amount: expense.amount + (Math.random() * expense.amount * 0.3 - expense.amount * 0.15),
        title: expense.title,
        description: i === 0 ? `Monthly ${expense.title.toLowerCase()}` : undefined,
        date: date,
      });
    }
  }

  // Create transactions for anotherUser
  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    transactions.push({
      userId: anotherUser.id,
      categoryId: anotherUserIncomeCat.id,
      type: TransactionType.INCOME,
      amount: 4000 + Math.random() * 500,
      title: 'Monthly Salary',
      description: `Salary for ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      date: date,
    });
  }

  for (let i = 0; i < 10; i++) {
    const monthsAgo = Math.floor(Math.random() * 3);
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
    
    transactions.push({
      userId: anotherUser.id,
      categoryId: anotherUserExpenseCat.id,
      type: TransactionType.EXPENSE,
      amount: 20 + Math.random() * 80,
      title: 'Food Expense',
      description: 'Daily food expenses',
      date: date,
    });
  }

  // Insert all transactions
  await prisma.transaction.createMany({
    data: transactions,
  });

  console.log(`✅ Created ${transactions.length} transactions`);

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`   Users: ${3}`);
  console.log(`   Categories: ${userCategories.length + 2}`);
  console.log(`   Transactions: ${transactions.length}`);
  console.log('\n🔑 Login Credentials:');
  console.log('   Admin:');
  console.log('     Email: admin@example.com');
  console.log('     Password: password123');
  console.log('   Regular User:');
  console.log('     Email: user@example.com');
  console.log('     Password: password123');
  console.log('   Another User:');
  console.log('     Email: jane@example.com');
  console.log('     Password: password123');
  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
