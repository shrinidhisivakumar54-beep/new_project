import {test,expect} from '@playwright/test';
test('swipe buttons, undo, filter and persisted board',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Find your kind of work.'})).toBeVisible();
 await page.getByRole('button',{name:'Interested in task'}).click();
 await expect(page.getByRole('heading',{name:'Find the story hiding in our survey data.'})).toBeVisible();
 await page.getByRole('button',{name:'Undo last swipe'}).click();
 await expect(page.getByRole('heading',{name:'Make these slides a little less… spreadsheet.'})).toBeVisible();
 await page.getByRole('button',{name:'Interested in task'}).click();
 await page.getByRole('button',{name:/My board/}).click();
 await expect(page.getByRole('heading',{name:'Make these slides a little less… spreadsheet.'})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:/My board/}).click();
 await expect(page.getByRole('heading',{name:'Make these slides a little less… spreadsheet.'})).toBeVisible();
 await page.getByRole('button',{name:'Build a trade'}).click();
 await page.getByLabel('What would you like help with in return?').fill('Check my spreadsheet formulas. Done when totals reconcile.');
 await page.getByLabel('Proposed timing').fill('Thursday');
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Save trade draft'}).click();
 await expect(page.getByText('Local draft · not sent')).toBeVisible();
});
test('project context becomes reviewable task and persists',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Project notes',exact:true}).click();
 await page.getByLabel('Project name').fill('Autumn launch');
 await page.getByLabel('What are you trying to achieve?').fill('Explain our new feature to customers');
 await page.getByLabel('What needs to be delivered?').fill('Six launch slides');
 await page.getByLabel('What does “done” look like?').fill('One takeaway per slide');
 await page.getByRole('button',{name:'Create demo suggestions'}).click();
 await expect(page.getByText('Template suggestions · not AI-generated')).toBeVisible();
 await page.getByRole('button',{name:'Review & post'}).nth(1).click();
 await expect(page.getByLabel('Deliverable',{exact:true})).toHaveValue('Six launch slides');
 await page.getByLabel('What can you offer in return?').fill('I can edit your email');
 await page.getByRole('button',{name:'Post to my workspace'}).click();
 await expect(page.getByRole('heading',{name:'Create Six launch slides'})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Project notes',exact:true}).click();
 await expect(page.getByLabel('Project name')).toHaveValue('Autumn launch');
});
test('drag, keyboard and search work independently',async({page})=>{
 await page.goto('/');const card=page.locator('.swipe-card');await card.scrollIntoViewIfNeeded();const box=await card.boundingBox();
 await page.mouse.move(box.x+90,box.y+100);await page.mouse.down();await page.mouse.move(box.x+220,box.y+100,{steps:10});await page.mouse.up();
 await expect(page.getByRole('heading',{name:'Find the story hiding in our survey data.'})).toBeVisible();
 await page.locator('h1').click();await page.keyboard.press('ArrowLeft');
 await expect(page.getByRole('heading',{name:'Give our launch email a human voice.'})).toBeVisible();
 await page.locator('#task-search').fill('no such task');await expect(page.getByRole('heading',{name:'No tasks match just yet.'})).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();await expect(page.getByRole('heading',{name:'Give our launch email a human voice.'})).toBeVisible();
});
test('mobile has no horizontal overflow and usable nav',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('button',{name:'Interested in task'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'/tmp/taskswap-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Toggle navigation'}).click();await page.getByRole('button',{name:'Project notes',exact:true}).click();
 await expect(page.getByLabel('Project name')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('API rejects incomplete briefs and serves explicit demo mode',async({request})=>{
 const bad=await request.post('/api/plan',{data:{brief:{title:'No context'}}});expect(bad.status()).toBe(400);
 const good=await request.post('/api/plan',{data:{brief:{title:'Launch',goal:'Explain feature',deliverable:'Slides',done:'Approved',constraints:'No private data'}}});expect(good.ok()).toBe(true);const body=await good.json();expect(body.mode).toBe('demo');expect(body.tasks[1].constraints).toBe('No private data');
});
test('desktop visual and modal keyboard dismissal',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await page.goto('/');await page.screenshot({path:'/tmp/taskswap-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Post a task',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});
