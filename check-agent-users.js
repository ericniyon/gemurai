const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAgentUsers() {
    try {
        console.log('🔍 Investigating AGENT users and role assignments...\n');
        
        // Check if AGENT role exists
        console.log('1. Checking if AGENT role exists...');
        const agentRole = await prisma.role.findUnique({
            where: { name: 'AGENT' }
        });
        
        if (agentRole) {
            console.log(`✅ AGENT role found: ${agentRole.name} (ID: ${agentRole.id})`);
        } else {
            console.log('❌ AGENT role not found');
            return;
        }
        
        // Check for users with AGENT role assignments
        console.log('\n2. Checking for AGENT role assignments...');
        const agentAssignments = await prisma.userRoleAssignment.findMany({
            where: {
                roleId: agentRole.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                role: true
            }
        });
        
        if (agentAssignments.length > 0) {
            console.log(`✅ Found ${agentAssignments.length} AGENT role assignments:`);
            agentAssignments.forEach(assignment => {
                console.log(`  - ${assignment.user.email} (${assignment.user.name || 'No name'})`);
                console.log(`    User ID: ${assignment.user.id}`);
                console.log(`    Assignment ID: ${assignment.id}`);
                console.log(`    Assigned: ${assignment.assignedAt}`);
                console.log('');
            });
        } else {
            console.log('❌ No AGENT role assignments found');
        }
        
        // Check specific users we know should be AGENT
        console.log('3. Checking specific users that should be AGENT...');
        const agentEmails = [
            'perfectizihirwe@gmail.com',
            'umwizashakiraho1@gmail.com', 
            'niyoeri@gmail.com'
        ];
        
        for (const email of agentEmails) {
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    userRole: {
                        include: {
                            role: true
                        }
                    }
                }
            });
            
            if (user) {
                const roleName = user.userRole?.[0]?.role?.name || 'NO ROLE';
                console.log(`  - ${email}: ${roleName}`);
            } else {
                console.log(`  - ${email}: USER NOT FOUND`);
            }
        }
        
        // Test password update API access for AGENT user
        if (agentAssignments.length > 0) {
            const testUser = agentAssignments[0].user;
            console.log(`\n4. Testing password update for AGENT user: ${testUser.email}`);
            
            // Get full user data with password
            const fullUser = await prisma.user.findUnique({
                where: { id: testUser.id },
                include: {
                    userRole: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            
            if (fullUser) {
                const permissions = fullUser.userRole?.[0]?.role?.rolePermissions?.map(rp => rp.permission.name) || [];
                console.log(`✅ AGENT user permissions (${permissions.length} total):`);
                console.log(`🔑 Key permissions: ${permissions.filter(p => p.includes('dashboard') || p.includes('applications')).join(', ')}`);
                
                console.log(`\n📋 Password update test instructions for ${testUser.email}:`);
                console.log('1. Login with this user account');
                console.log('2. Navigate to /dashboard/settings');
                console.log('3. Click Security tab');
                console.log('4. Fill password update form');
                console.log('5. Test "Update Password" button');
                
                console.log('\n✅ AGENT user ready for password update testing!');
            }
        }
        
        console.log('\n📊 Summary:');
        console.log(`- AGENT role exists: ${agentRole ? 'YES' : 'NO'}`);
        console.log(`- AGENT users found: ${agentAssignments.length}`);
        console.log(`- Password update API should work for AGENT users: ${agentAssignments.length > 0 ? 'YES' : 'NO'}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAgentUsers(); 